const fs = require('fs');
let code = fs.readFileSync('src/pages/MyProfile.jsx', 'utf8');

code = code.replace(/useEffect\(\(\) => \{\s*const target = followersSentinelRef\.current[\s\S]*?\}\, \[\s*followersQuery[\s\S]*?\]\)/g, '');
code = code.replace(/useEffect\(\(\) => \{\s*const target = followingSentinelRef\.current[\s\S]*?\}\, \[\s*followingQuery[\s\S]*?\]\)/g, '');

// remove followingSentinelRef and followersSentinelRef references
code = code.replace(/const followersSentinelRef = useRef\(null\)/g, '');
code = code.replace(/const followingSentinelRef = useRef\(null\)/g, '');

fs.writeFileSync('src/pages/MyProfile.jsx', code);
