import { useRestaurantStore } from '../../store/useRestaurantStore';

export function StoryDialogueModal() {
  const activeStory = useRestaurantStore((s) => s.activeStory);
  const storyLineIndex = useRestaurantStore((s) => s.storyLineIndex);
  const advanceStory = useRestaurantStore((s) => s.advanceStory);
  const day = useRestaurantStore((s) => s.day);

  if (!activeStory) return null;

  const line = activeStory.lines[storyLineIndex];
  const isLastLine = storyLineIndex >= activeStory.lines.length - 1;

  return (
    <div
      className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 cursor-pointer select-none"
      onClick={advanceStory}
    >
      <div className="w-full max-w-2xl mx-4">
        <div className="bg-gray-900 border border-yellow-600 rounded-xl p-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">{line.portrait}</span>
            <span className="text-yellow-400 font-bold text-lg">{line.speaker}</span>
          </div>

          <p className="text-gray-200 text-base leading-relaxed mb-4">
            {line.text}
          </p>

          <div className="text-right text-sm text-gray-500 animate-pulse">
            {isLastLine ? `▶ Begin Day ${day}` : '▼ Click to continue'}
          </div>
        </div>
      </div>
    </div>
  );
}
