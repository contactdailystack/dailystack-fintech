const fs = require('fs');
const data = fs.readFileSync("C:\\Users\\Pick\\.local\\share\\opencode\\tool-output\\tool_ea683a363001M5gv1HjzIGmWHH", "utf-8");
// Extract base64 from the data URL
const match = data.match(/"content": "data:image\/png;base64,([^"]+)"/);
if (match) {
    const buf = Buffer.from(match[1], 'base64');
    fs.writeFileSync("D:\\Coding Folder\\dailystack-fintech\\screenshot.png", buf);
    console.log("Saved", buf.length, "bytes");
} else {
    console.log("No base64 image found");
    console.log(data);
}
