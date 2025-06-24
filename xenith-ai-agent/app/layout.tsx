import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { ProductPanelProvider } from '@/lib/product-panel-context'
import { ReviewPanelProvider } from '@/lib/review-panel-context'
import { ChartPinProvider } from '@/lib/chart-pin-context'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Xenith - AI Market Research Platform',
  description: 'Powered by 3PO Lab',
  icons: {
    icon: '/logo-icon-0617-scarlett.svg',
    shortcut: '/logo-icon-0617-scarlett.svg',
    apple: '/logo-icon-0617-scarlett.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ChartPinProvider>
            <ProductPanelProvider>
              <ReviewPanelProvider>
                {children}
                <Toaster />
              </ReviewPanelProvider>
            </ProductPanelProvider>
          </ChartPinProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
