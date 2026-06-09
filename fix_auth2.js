const fs = require('fs');
const path = "D:\\Coding Folder\\dailystack-fintech\\app\\src\\services\\authService.ts";
let content = fs.readFileSync(path, "utf-8");

// Use exact string from file (em-dashes)
const old = `export const getCurrentUser = (): User | null => {
  // Synchronous — reads from the persisted session without a network call
  const { data } = supabase.auth.getUser();
  return data.user;
};`;

const replacement = `export const getCurrentUser = async (): Promise<User | null> => {
  // Async - validates session with a lightweight network call
  const { data, error } = await supabase.auth.getUser();
  if (error || !data) return null;
  return data.user;
};`;

if (content.includes(old)) {
    content = content.replace(old, replacement);
    fs.writeFileSync(path, content, "utf-8");
    console.log("Done");
} else {
    // Find exact pattern
    const idx = content.indexOf("getCurrentUser");
    const slice = content.substring(idx, idx + 400);
    console.log("Actual slice:\n" + JSON.stringify(slice));
}
