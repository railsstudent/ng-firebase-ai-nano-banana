import { ChangeDetectionStrategy, Component, ElementRef, computed, input, output, signal, viewChild } from '@angular/core';
import { UploadCloudIconComponent } from '../icons/upload-cloud-icon.component';
import { TrashIconComponent } from '../icons/trash-icon.component';
import { UploadedFile } from './types/uploaded-file';

const KILOBYTE = 1024;

@Component({
  selector: 'app-dropzone',
  templateUrl: './dropzone.component.html',
  imports: [UploadCloudIconComponent, TrashIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(dragover)': 'onDragOver($event)',
    '(dragleave)': 'onDragLeave($event)',
    '(drop)': 'onDrop($event)',
  },
})
export class DropzoneComponent {
  mode = input<'single' | 'multiple'>('single');
  maxFileSize = input(20 * KILOBYTE * KILOBYTE);
  maxFiles = input(5);
  filesChanged = output<File[]>();

  fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  uploadedFiles = signal<UploadedFile[]>([]);
  isDragging = signal(false);
  error = signal<string | null>(null);

  maxFileSizeMB = computed(() => this.maxFileSize() / KILOBYTE / KILOBYTE);

  isUploadDisabled = computed(() =>
    this.mode() === 'multiple' && this.uploadedFiles().length >= this.maxFiles()
  );

  private readonly acceptedFileTypes = ['image/jpeg', 'image/png', 'image/jpg'];

  strAcceptedFileTypes = computed(() => this.acceptedFileTypes.join(','));

  allowMultiple = computed(() => this.mode() === 'multiple');

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.isUploadDisabled()) {
      return;
    }
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
    if (this.isUploadDisabled()) {
      return;
    }
    this.error.set(null);
    const files = event.dataTransfer?.files;
    if (files) {
      this.handleFiles(files);
    }
  }

  onFileSelected(event: Event): void {
    if (this.isUploadDisabled()) {
      return;
    }
    this.error.set(null);
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(input.files);
    }
    // Reset file input to allow selecting the same file again
    input.value = '';
  }

  triggerFileInput(): void {
    if (this.isUploadDisabled()) {
      return;
    }
    this.fileInput().nativeElement.click();
  }

  removeFile(fileToRemove: UploadedFile): void {
    this.uploadedFiles.update(files => files.filter(f => f !== fileToRemove));
    this.emitFiles();
    if (this.error()?.includes('maximum of')) {
      this.error.set(null);
    }
  }

  private handleFiles(files: FileList): void {
    const allFiles = Array.from(files);
    const validFiles: File[] = [];
    let hasTypeError = false;
    let hasSizeError = false;

    for (const file of allFiles) {
      if (!this.validateFileType(file)) {
        hasTypeError = true;
      } else if (!this.validateFileSize(file)) {
        hasSizeError = true;
      } else {
        validFiles.push(file);
      }
    }

    let errorMessage: string | null = null;
    if (hasTypeError && hasSizeError) {
      errorMessage = `Invalid file types and sizes. Please use PNG/JPEG under ${this.maxFileSizeMB()}MB.`;
    } else if (hasTypeError) {
      errorMessage = 'Invalid file type. Please upload jpeg or png images.';
    } else if (hasSizeError) {
      errorMessage = `One or more files exceed the ${this.maxFileSizeMB()}MB size limit.`;
    }
    this.error.set(errorMessage);


    if (validFiles.length === 0) {
      return;
    }

    if (this.mode() === 'single') {
      this.uploadedFiles.set([]);
      this.processFile(validFiles[0]);
    } else {
      const currentFileCount = this.uploadedFiles().length;
      const remainingSlots = this.maxFiles() - currentFileCount;
      const filesToAdd = validFiles.slice(0, remainingSlots);

      if (validFiles.length > remainingSlots) {
        const plural = this.maxFiles() > 1 ? 's' : '';
        const newErrorMessage = `Maximum of ${this.maxFiles()} file${plural} allowed. Some files were not added.`;
        this.error.set(this.error() ? `${this.error()} ${newErrorMessage}` : newErrorMessage);
      }

      filesToAdd.forEach(file => this.processFile(file));
    }
  }

  private processFile(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const url = e.target?.result as string;
      this.uploadedFiles.update(currentFiles => [...currentFiles, { file, url }]);
      this.emitFiles();
    };
    reader.readAsDataURL(file);
  }

  private validateFileType(file: File): boolean {
    return this.acceptedFileTypes.includes(file.type);
  }

  private validateFileSize(file: File): boolean {
    return file.size <= this.maxFileSize();
  }

  private emitFiles(): void {
    this.filesChanged.emit(this.uploadedFiles().map(uf => uf.file));
  }

  clearAllFiles(): void {
    this.uploadedFiles.set([]);
    this.error.set(null);
    this.filesChanged.emit([]);
  }
}
