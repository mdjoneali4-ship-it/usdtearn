import './globals.css'

export const metadata = {
  title: 'USDTEarn.ai - Micro-Task Marketplace',
  description: 'Earn USDT completing micro tasks',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
