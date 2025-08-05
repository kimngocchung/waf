
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Define the path to the shared config files
const CONFIG_DIR = path.resolve(process.cwd(), 'config');
const DOMAINS_JSON_PATH = path.join(CONFIG_DIR, 'allowed_domains.json');
// Nginx will read this map file to filter domains.
const DOMAINS_MAP_PATH = path.join(CONFIG_DIR, 'allowed_hosts.map');


// Helper to ensure the config directory exists
async function ensureConfigDir(): Promise<void> {
    try {
        await fs.access(CONFIG_DIR);
    } catch {
        await fs.mkdir(CONFIG_DIR, { recursive: true });
    }
}

// Helper function to read domains from the JSON file
async function getAllowedDomains(): Promise<string[]> {
    try {
        await ensureConfigDir();
        const fileContent = await fs.readFile(DOMAINS_JSON_PATH, 'utf-8');
        // Handle empty file case by returning an empty array
        return fileContent ? JSON.parse(fileContent) : [];
    } catch (error) {
        // If the file doesn't exist (e.g., first run), return a default array
        if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
            await fs.writeFile(DOMAINS_JSON_PATH, JSON.stringify(['localhost']));
            return ['localhost'];
        }
        // For other errors, log it and return an empty array
        console.error("Error reading domains file:", error);
        return [];
    }
}

// Helper function to write domains to JSON and update the Nginx map file
async function updateDomainFiles(domains: string[]): Promise<void> {
    await ensureConfigDir();
    // Write to the JSON file for the dashboard's reference
    await fs.writeFile(DOMAINS_JSON_PATH, JSON.stringify(domains, null, 2), 'utf-8');

    // Generate the content for the Nginx map file
    const mapContent = domains.map(domain => `${domain} 1;`).join('\n');
    await fs.writeFile(DOMAINS_MAP_PATH, mapContent, 'utf-8');
}


// GET /api/domains - Fetches the list of allowed domains
export async function GET() {
    try {
        const domains = await getAllowedDomains();
        // Ensure the map file is in sync when fetching
        await updateDomainFiles(domains);
        return NextResponse.json({ domains });
    } catch (error) {
        console.error('Failed to read domains file:', error);
        return NextResponse.json({ message: 'Error reading allowed domains' }, { status: 500 });
    }
}

// POST /api/domains - Adds a new domain to the list
export async function POST(request: Request) {
    try {
        const { domain } = await request.json();
        if (!domain) {
            return NextResponse.json({ message: 'Domain is required' }, { status: 400 });
        }

        const domains = await getAllowedDomains();
        if (domains.includes(domain)) {
            return NextResponse.json({ message: 'Domain already exists' }, { status: 409 });
        }

        const updatedDomains = [...domains, domain];
        await updateDomainFiles(updatedDomains);
        
        return NextResponse.json({ message: 'Domain added successfully', domains: updatedDomains });
    } catch (error) {
        console.error('Failed to add domain:', error);
        return NextResponse.json({ message: 'Error adding domain' }, { status: 500 });
    }
}

// DELETE /api/domains - Removes a domain from the list
export async function DELETE(request: Request) {
    try {
        const { domain } = await request.json();
        if (!domain) {
            return NextResponse.json({ message: 'Domain is required' }, { status: 400 });
        }

        const domains = await getAllowedDomains();
        if (!domains.includes(domain)) {
            return NextResponse.json({ message: 'Domain not found' }, { status: 404 });
        }

        const updatedDomains = domains.filter(d => d !== domain);
        await updateDomainFiles(updatedDomains);

        return NextResponse.json({ message: 'Domain deleted successfully', domains: updatedDomains });
    } catch (error) {
        console.error('Failed to delete domain:', error);
        return NextResponse.json({ message: 'Error deleting domain' }, { status: 500 });
    }
}
