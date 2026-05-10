export const calculateHash = async (value: string): Promise<string> => {
    const data = new TextEncoder().encode(value);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
        .map((v) => v.toString(16).padStart(2, "0"))
        .join("");
};
