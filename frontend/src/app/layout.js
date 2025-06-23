
import './globals.css';

export const metadata = {
  title: 'File Upload Assessment',
  description: 'A full-stack file upload application',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}