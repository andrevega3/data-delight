export interface ApiResponse<T> {
    success: boolean;
    result?: T;
    error?: string;
}

export async function postRequest<T>(url: string, body: any): Promise<ApiResponse<T>> {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            return {
                success: false,
                error: errorText,
            };
        }
        const { result }  = await response.json();
        return {
            success: true,
            result,
        };
    } catch (error: unknown) {
        let errorMessage: string;

        if (error instanceof Error) {
            errorMessage = String(error);
        } else {
            errorMessage = String(error);
        }

        return {
            success: false,
            error: errorMessage,
        }
    }
}

export async function getRequest<T>(url: string): Promise<ApiResponse<T>> {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            return {
                success: false,
                error: errorText,
            };
        }
        const result: T = await response.json();
        return {
            success: true,
            result,
        };
    } catch (error: unknown) {
        let errorMessage: string;

        if (error instanceof Error) {
            errorMessage = String(error);
        } else {
            errorMessage = String(error);
        }

        return {
            success: false,
            error: errorMessage,
        };
    }
}