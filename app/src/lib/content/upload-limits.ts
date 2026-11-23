// next.config.ts sizes the proxy body buffer from these, so the upload route sees whole files.
export const MAX_UPLOAD_MB = parseInt(process.env.MAX_COURSE_FILE_SIZE_MB ?? "50", 10);
export const MULTIPART_OVERHEAD_BYTES = 64 * 1024;
