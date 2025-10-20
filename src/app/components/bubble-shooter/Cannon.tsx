import type { FC } from 'react';

interface CannonProps {
  angle: number;
  bubbleColor: string;
  bubbleSize: number;
  boardWidth: number;
  boardHeight: number;
}

const Cannon: FC<CannonProps> = ({ angle, bubbleColor, bubbleSize, boardWidth, boardHeight }) => {
  const cannonBaseWidth = 120;
  const cannonBaseHeight = 36;
  const barrelWidth = 26;
  const barrelHeight = 120;
  const barrelY = boardHeight - barrelHeight - cannonBaseHeight + 12;
  const bubbleYOffset = 18;

  return (
    <>
      <div
        className="pointer-events-none absolute"
        style={{
          width: `${barrelWidth}px`,
          height: `${barrelHeight}px`,
          left: `${boardWidth / 2}px`,
          top: `${barrelY}px`,
          transform: `translate(-50%, 0) rotate(${(angle * 180) / Math.PI}deg)`,
          transformOrigin: '50% 90%',
          borderRadius: '9999px',
          background: 'linear-gradient(180deg, rgba(148,163,184,0.95) 0%, rgba(51,65,85,0.95) 100%)',
          boxShadow: '0 12px 24px rgba(15,23,42,0.45)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: `${bubbleYOffset}px`,
            transform: 'translate(-50%, -50%)',
            width: `${bubbleSize}px`,
            height: `${bubbleSize}px`,
            borderRadius: '9999px',
            border: '2px solid rgba(255,255,255,0.18)',
            background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), ${bubbleColor})`,
            boxShadow: '0 6px 16px rgba(0,0,0,0.35)',
            opacity: 0.7,
          }}
        />
      </div>
      <div
        className="pointer-events-none absolute"
        style={{
          width: `${cannonBaseWidth}px`,
          height: `${cannonBaseHeight}px`,
          left: `${boardWidth / 2}px`,
          top: `${boardHeight - cannonBaseHeight}px`,
          transform: 'translate(-50%, 0)',
          borderRadius: '9999px',
          background: 'linear-gradient(180deg, rgba(30,41,59,0.95) 0%, rgba(15,23,42,0.95) 100%)',
          boxShadow: '0 -4px 12px rgba(15,23,42,0.6)',
        }}
      />
    </>
  );
};

export default Cannon;
