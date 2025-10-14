export type VisualStoryArgs = {
  style: 'consistent' | 'evolving';
  numberOfImages: number;
  transition: 'smooth' | 'dramatic' | 'fade';
  type: 'story' | 'process' | 'tutorial' | 'timeline';
}

export type VisualStoryGenerateArgs = {
  args: VisualStoryArgs;
  userPrompt: string;
}
