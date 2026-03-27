import { useState } from 'react';
import { Send, Archive, Trash2, Tag, Search } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import useStore from '../store/useStore';

const tagColors = { todo: 'amber', idea: 'sage', link: 'slate', note: 'cream' };
const tagOptions = ['note', 'todo', 'idea', 'link'];

function timeAgo(timestamp) {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function Inbox() {
  const { inboxItems, addInboxItem, archiveInboxItem, deleteInboxItem } = useStore();
  const [input, setInput] = useState('');
  const [selectedTag, setSelectedTag] = useState('note');
  const [filterTag, setFilterTag] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  const handleSubmit = () => {
    if (!input.trim()) return;
    addInboxItem(input.trim(), selectedTag);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const filtered = inboxItems.filter(item => {
    if (!showArchived && item.archived) return false;
    if (showArchived && !item.archived) return false;
    if (filterTag && item.tag !== filterTag) return false;
    if (searchQuery && !item.content.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 stagger-fade max-w-3xl">
      {/* Capture Input */}
      <Card>
        <div className="space-y-3">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What's on your mind?"
            rows={3}
            className="w-full bg-bg-input border border-border rounded-none px-4 py-3 text-text-primary font-body placeholder:text-text-tertiary focus:outline-none focus:border-accent-cream resize-none transition-colors"
          />
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {tagOptions.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-2 py-1 text-xs font-body transition-colors ${
                    selectedTag === tag
                      ? 'bg-bg-tertiary text-accent-cream border border-border-hover'
                      : 'text-text-tertiary hover:text-text-primary border border-transparent'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <Button size="sm" onClick={handleSubmit} disabled={!input.trim()}>
              <Send className="w-3.5 h-3.5" /> Capture
            </Button>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search inbox..."
            className="w-full bg-bg-input border border-border rounded-none pl-9 pr-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-cream"
          />
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setFilterTag('')}
            className={`px-2 py-1 text-xs ${!filterTag ? 'bg-bg-tertiary text-accent-cream' : 'text-text-tertiary hover:text-text-primary'}`}
          >
            All
          </button>
          {tagOptions.map(tag => (
            <button
              key={tag}
              onClick={() => setFilterTag(filterTag === tag ? '' : tag)}
              className={`px-2 py-1 text-xs ${filterTag === tag ? 'bg-bg-tertiary text-accent-cream' : 'text-text-tertiary hover:text-text-primary'}`}
            >
              {tag}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowArchived(!showArchived)}
          className={`text-xs px-2 py-1 ${showArchived ? 'bg-bg-tertiary text-accent-cream' : 'text-text-tertiary hover:text-text-primary'}`}
        >
          {showArchived ? 'Show Active' : 'Show Archived'}
        </button>
      </div>

      {/* Inbox List */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-text-tertiary">
            {showArchived ? 'No archived items.' : 'Inbox is empty. Capture something!'}
          </div>
        )}
        {filtered.map(item => (
          <div
            key={item.id}
            className="bg-bg-secondary border border-border p-4 hover:bg-bg-tertiary transition-colors group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary leading-relaxed">{item.content}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge color={tagColors[item.tag]}>{item.tag}</Badge>
                  <span className="text-[11px] font-mono text-text-tertiary">{timeAgo(item.timestamp)}</span>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                {!item.archived && (
                  <button
                    onClick={() => archiveInboxItem(item.id)}
                    className="p-1.5 text-text-tertiary hover:text-accent-sage transition-colors"
                    title="Archive"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => deleteInboxItem(item.id)}
                  className="p-1.5 text-text-tertiary hover:text-accent-rose transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
