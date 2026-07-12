import { describe, expect, it } from "vitest";
import { initialsForUserAvatar, initialsFromDisplay } from "@/lib/avatarDisplay";

describe("initialsFromDisplay", () => {
  it("returns ? for empty label", () => {
    expect(initialsFromDisplay("")).toBe("?");
    expect(initialsFromDisplay("   ")).toBe("?");
  });

  it("uses local-part for email-like labels without spaces", () => {
    expect(initialsFromDisplay("ana.silva@escola.com")).toBe("AN");
  });

  it("uses first and last name initials", () => {
    expect(initialsFromDisplay("Ana Silva")).toBe("AS");
    expect(initialsFromDisplay("Ana Maria Silva")).toBe("AS");
  });

  it("uses first two chars for single token", () => {
    expect(initialsFromDisplay("Ana")).toBe("AN");
  });
});

describe("initialsForUserAvatar", () => {
  it("prefers name over email", () => {
    expect(initialsForUserAvatar({ name: "Ana Silva", email: "x@y.com" })).toBe("AS");
  });

  it("falls back to email when name is missing", () => {
    expect(initialsForUserAvatar({ name: null, email: "bob@escola.com" })).toBe("BO");
  });

  it("uses email when name equals generic label", () => {
    expect(
      initialsForUserAvatar({
        name: "Aluno",
        email: "carla@escola.com",
        genericLabel: "Aluno",
      }),
    ).toBe("CA");
  });

  it("returns ? when nothing useful is provided", () => {
    expect(initialsForUserAvatar({})).toBe("?");
  });
});
