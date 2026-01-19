import xss from 'xss';

console.log("XSS Import Type:", typeof xss);
console.log("XSS Import Value:", xss);

const html = '<script>alert("xss");</script>';
try {
    const clean = xss(html);
    console.log("Cleaned:", clean);
} catch (e) {
    console.error("Error using xss:", e);
}
