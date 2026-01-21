interface ProgressBarProps {
  raised: number;
  goal: number;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ProgressBar({ 
  raised, 
  goal, 
  showLabels = true,
  size = 'md' 
}: ProgressBarProps) {
  const percentage = Math.min((raised / goal) * 100, 100);
  const isComplete = raised >= goal;

  const heightClass = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  }[size];

  return (
    <div className="w-full">
      {showLabels && (
        <div className="flex justify-between text-sm mb-2">
          <span className="font-heading font-medium text-dark-100">
            ${raised.toLocaleString()} <span className="text-dark-400 font-body font-normal">raised</span>
          </span>
          <span className={`font-heading font-semibold ${isComplete ? 'text-green-400' : 'text-primary-400'}`}>
            {percentage.toFixed(0)}%
          </span>
        </div>
      )}
      
      <div className={`progress-bar ${heightClass}`}>
        <div
          className={`progress-bar-fill ${heightClass} ${isComplete ? 'complete' : ''}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {showLabels && (
        <div className="flex justify-between text-sm mt-2">
          <span className="text-dark-500">
            Goal: <span className="text-dark-300">${goal.toLocaleString()}</span>
          </span>
          {isComplete && (
            <span className="badge-success">
              Funded!
            </span>
          )}
        </div>
      )}
    </div>
  );
}
