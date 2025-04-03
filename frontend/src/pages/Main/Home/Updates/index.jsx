import { news } from "./news";

export default function Updates() {
  return (
    <div>
      <h1 className="text-theme-home-text uppercase text-sm font-semibold mb-4">
        Updates
      </h1>
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {news.map((item) => (
          <UpdateCard
            key={item.id}
            thumbnail_url={item.thumbnail_url}
            title={item.title}
            subtitle={item.short_description}
            source={item.source}
            date={item.date}
            goto={item.goto}
          />
        ))}
      </div>
    </div>
  );
}

function UpdateCard({ thumbnail_url, title, subtitle, source, date, goto }) {
  return (
    <a href={goto} target="_blank" rel="noopener noreferrer" className="block">
      <div className="light:border light:border-theme-home-border bg-theme-home-update-card-bg rounded-xl p-4 flex gap-x-4 hover:bg-theme-home-update-card-hover transition-colors">
        <img
          src={thumbnail_url}
          alt={title}
          className="w-[80px] h-[80px] rounded-lg flex-shrink-0 object-cover"
        />
        <div className="flex flex-col gap-y-1">
          <p className="text-theme-home-text-secondary text-xs">{source}</p>
          <h3 className="text-theme-home-text font-medium text-sm">{title}</h3>
          <p className="text-theme-home-text-secondary text-xs line-clamp-2">
            {subtitle}
          </p>
          <div className="flex items-center gap-x-4 text-xs text-theme-home-text-secondary">
            <span className="text-theme-home-update-source">{source}</span>
            <span>{date}</span>
          </div>
        </div>
      </div>
    </a>
  );
}
