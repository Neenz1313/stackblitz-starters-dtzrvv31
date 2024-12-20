import { NextApiRequest, NextApiResponse } from 'next';
import { URL } from 'url';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        // Ensure the environment variable exists and is valid before using it
        const directLineEndpointUrl = process.env.DIRECT_LINE_ENDPOINT_URL;
        const directLineSecret = process.env.DIRECT_LINE_SECRET;

        // Check if the environment variables are set
        if (!directLineEndpointUrl || !directLineSecret) {
            throw new Error("Environment variables DIRECT_LINE_ENDPOINT_URL or DIRECT_LINE_SECRET are not set.");
        }

        // Create URL object and extract the query parameter
        const tokenEndpointURL: URL = new URL(directLineEndpointUrl);
        const tokenEndpointSecret: string = directLineSecret;

        // Safely retrieve the 'api-version' parameter
        const apiVersion: string | null = tokenEndpointURL.searchParams.get('api-version');

        if (apiVersion === null) {
            throw new Error("'api-version' parameter not found in the URL.");
        }

        const [directLineURL, token] = await Promise.all([
            fetch(new URL(`/powervirtualagents/regionalchannelsettings?api-version=${apiVersion}`, tokenEndpointURL), {
                headers: {
                    'Authorization': `Bearer ${tokenEndpointSecret}`,
                },
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Failed to retrieve regional channel settings.');
                    }
                    return response.json();
                })
                .then(({ channelUrlsById: { directline } }) => directline),

            fetch(tokenEndpointURL, {
                headers: {
                    'Authorization': `Bearer ${tokenEndpointSecret}`,
                },
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Failed to retrieve Direct Line token.');
                    }
                    return response.json();
                })
                .then(({ token }) => token),
        ]);

        res.status(200).json({ directLineURL, token });
    }
    catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: 'An unknown error occurred' });
        }
    }
}
