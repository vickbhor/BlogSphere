const fs = require('fs');
const path = 'src/pages/MyProfile.jsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add imports
if (!code.includes('useAuthorProfile')) {
  code = code.replace(
    /import \{ useAuth \} from '\.\.\/context\/AuthContext'/,
    "import { useAuth } from '../context/AuthContext'\nimport { useAuthorProfile } from '../hooks/useFollow'\nimport { FollowButton } from '../components/follow/FollowButton'"
  );
}

// 2. Add NetworkUserCard component
if (!code.includes('function NetworkUserCard')) {
  const cardComponent = `
function NetworkUserCard({ person }) {
  const isId = typeof person === 'string';
  const id = isId ? person : person._id || person.id;
  
  const { data, isLoading } = useAuthorProfile(id);
  const user = data?.author || data?.user || (!isId ? person : null);

  const getFallbackAvatar = (name) => \`https://ui-avatars.com/api/?name=\${encodeURIComponent(name || 'User')}&background=random\`;

  if (isLoading && !user) {
    return (
      <div className="flex items-center gap-4 rounded-2xl border border-outline-variant/30 bg-surface-container/55 p-4 animate-pulse">
        <div className="h-12 w-12 rounded-full bg-outline-variant/20" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-outline-variant/20 rounded w-1/3" />
          <div className="h-3 bg-outline-variant/20 rounded w-1/2" />
        </div>
      </div>
    )
  }

  if (!user) return null;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="flex items-center gap-4 rounded-2xl border border-outline-variant/30 bg-surface-container/55 p-4"
    >
      <Link to={\`/author/\${id}\`} className="shrink-0">
        <img 
          src={user.avatar || getFallbackAvatar(user.name)} 
          alt={user.name}
          onError={(e) => { e.target.src = getFallbackAvatar(user.name) }}
          className="h-12 w-12 rounded-full object-cover border border-primary/20"
        />
      </Link>
      <div className="flex-1 min-w-0">
        <Link to={\`/author/\${id}\`} className="hover:underline">
          <p className="font-semibold text-on-surface truncate cursor-pointer">
            {user.name}
          </p>
        </Link>
        <p className="text-xs text-on-surface-variant truncate">
          {user.bio || 'Author'}
        </p>
      </div>
      <div className="shrink-0 flex items-center justify-center min-w-[90px] min-h-[32px]">
        <FollowButton userId={id} className="h-8 text-xs px-3 w-full" />
      </div>
    </motion.div>
  )
}
`;
  code = code.replace('export default function MyProfile() {', cardComponent + '\nexport default function MyProfile() {');
}

// 3. Remove useInfiniteQuery hooks
code = code.replace(/const followersQuery[\s\S]*?getNextPageParam[\s\S]*?\}\)/g, '');
code = code.replace(/const followingQuery[\s\S]*?getNextPageParam[\s\S]*?\}\)/g, '');

// 4. Update followers/following memo
code = code.replace(
  /const followers = useMemo\([\s\S]*?\[followersQuery\.data\]\s*\)/g,
  `const followers = useMemo(() => profile?.followers || [], [profile])`
);
code = code.replace(
  /const following = useMemo\([\s\S]*?\[followingQuery\.data\]\s*\)/g,
  `const following = useMemo(() => profile?.following || [], [profile])`
);

// 5. Replace grid content
const followersGridRegex = /\{followers\.map\(\(person\) => \([\s\S]*?<\/motion\.div>\s*\)\)\}/g;
code = code.replace(followersGridRegex, 
  `{followers.length > 0 ? (
    followers.map((person, i) => (
      <NetworkUserCard key={typeof person === 'string' ? person : person._id || i} person={person} />
    ))
  ) : (
    <p className="text-on-surface-variant text-sm col-span-full text-center py-4">No followers found.</p>
  )}`
);

const followingGridRegex = /\{following\.map\(\(person\) => \([\s\S]*?<\/motion\.div>\s*\)\)\}/g;
code = code.replace(followingGridRegex, 
  `{following.length > 0 ? (
    following.map((person, i) => (
      <NetworkUserCard key={typeof person === 'string' ? person : person._id || i} person={person} />
    ))
  ) : (
    <p className="text-on-surface-variant text-sm col-span-full text-center py-4">No following found.</p>
  )}`
);

// 6. Optional: remove sentinel references
code = code.replace(/<div[^>]*ref=\{followersSentinelRef\}[^>]*>[\s\S]*?<\/div>/g, '');
code = code.replace(/<div[^>]*ref=\{followingSentinelRef\}[^>]*>[\s\S]*?<\/div>/g, '');

fs.writeFileSync(path, code);
