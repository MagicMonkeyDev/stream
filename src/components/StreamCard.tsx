import { FC } from 'react';
import { Users, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StreamCardProps {
  id: string;
  title: string;
  creator: string;
  thumbnailUrl: string;
  viewers: number;
  isLive: boolean;
}

export const StreamCard: FC<StreamCardProps> = ({
  id,
  title,
  creator,
  thumbnailUrl,
  viewers,
  isLive,
}) => {
  return (
    <Link to={`/stream/${id}`} className="group">
      <div className="bg-white/5 rounded-lg overflow-hidden transition-transform hover:scale-[1.02] hover:shadow-xl">
        <div className="relative aspect-video">
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
          {isLive && (
            <div className="absolute top-2 left-2">
              <span className="px-2 py-1 text-xs font-semibold bg-red-500 text-white rounded-lg flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                LIVE
              </span>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-medium truncate">{title}</h3>
              <p className="text-gray-400 text-sm">{creator}</p>
            </div>
            <div className="flex items-center text-gray-400 text-sm">
              <Users className="w-4 h-4 mr-1" />
              {viewers}
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1 text-purple-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
            <span>Watch stream</span>
            <ExternalLink className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  );
};