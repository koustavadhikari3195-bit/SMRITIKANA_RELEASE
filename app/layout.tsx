import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Smritikana Client Portal",
    description: "Secure portal for MFI registration and compliance management",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="antialiased">
                {children}
            </body>
        </html>
    );
}
