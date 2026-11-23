/**
 * Validates course upload files (manifest.json + markdown) before seeding.
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface ManifestData {
  id: string;
  title: string;
  description: string;
  entryFile?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  manifest?: ManifestData;
  partsCount?: number;
  chaptersCount?: number;
}

const PART_REGEX = /^# Part [IVXLCDM]+\s*[-–]\s*.+$/m;
const CHAPTER_REGEX = /^## Chapter \d+\s*[-–]\s*.+$/m;

/** Validate a manifest.json string. */
export function validateManifest(manifestJson: string): {
  valid: boolean;
  errors: ValidationError[];
  manifest?: ManifestData;
} {
  const errors: ValidationError[] = [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(manifestJson);
  } catch {
    return { valid: false, errors: [{ field: "manifest", message: "Invalid JSON format" }] };
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return {
      valid: false,
      errors: [{ field: "manifest", message: "Manifest must be a JSON object" }],
    };
  }

  const obj = parsed as Record<string, unknown>;

  if (!obj.id || typeof obj.id !== "string" || obj.id.trim().length === 0) {
    errors.push({ field: "id", message: "manifest.json must have a non-empty 'id' field" });
  } else if (!/^[a-zA-Z0-9_-]+$/.test((obj.id as string).trim())) {
    errors.push({
      field: "id",
      message: "manifest id must contain only alphanumeric characters, dashes, and underscores",
    });
  }
  if (!obj.title || typeof obj.title !== "string" || obj.title.trim().length === 0) {
    errors.push({ field: "title", message: "manifest.json must have a non-empty 'title' field" });
  }
  if (!obj.description || typeof obj.description !== "string") {
    errors.push({ field: "description", message: "manifest.json must have a 'description' field" });
  }

  if (errors.length > 0) return { valid: false, errors };

  return {
    valid: true,
    errors: [],
    manifest: {
      id: (obj.id as string).trim(),
      title: (obj.title as string).trim(),
      description: (obj.description as string).trim(),
      entryFile: typeof obj.entryFile === "string" ? obj.entryFile.trim() : undefined,
    },
  };
}

/** Validate markdown content structure. */
export function validateMarkdown(content: string): {
  valid: boolean;
  errors: ValidationError[];
  partsCount: number;
  chaptersCount: number;
} {
  const errors: ValidationError[] = [];

  if (!content || content.trim().length === 0) {
    return {
      valid: false,
      errors: [{ field: "markdown", message: "Markdown file is empty" }],
      partsCount: 0,
      chaptersCount: 0,
    };
  }

  const parts = content.match(new RegExp(PART_REGEX.source, "gm"));
  const chapters = content.match(new RegExp(CHAPTER_REGEX.source, "gm"));

  if (!parts || parts.length === 0) {
    errors.push({
      field: "markdown",
      message: "Invalid markdown format: no parts found. Expected '# Part I – Title' headings.",
    });
  }

  if (!chapters || chapters.length === 0) {
    errors.push({
      field: "markdown",
      message:
        "Invalid markdown format: no chapters found. Expected '## Chapter 1 – Title' headings.",
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    partsCount: parts?.length ?? 0,
    chaptersCount: chapters?.length ?? 0,
  };
}

/** Full validation of a course upload. */
export function validateCourseUpload(
  manifestJson: string,
  markdownContent: string,
): ValidationResult {
  const manifestResult = validateManifest(manifestJson);
  if (!manifestResult.valid) {
    return { valid: false, errors: manifestResult.errors };
  }

  const mdResult = validateMarkdown(markdownContent);
  if (!mdResult.valid) {
    return { valid: false, errors: mdResult.errors };
  }

  return {
    valid: true,
    errors: [],
    manifest: manifestResult.manifest,
    partsCount: mdResult.partsCount,
    chaptersCount: mdResult.chaptersCount,
  };
}
