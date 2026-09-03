import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "signalInvest | Bảng điều khiển thị trường",
  description: "Theo dõi dữ liệu thị trường có nguồn và phân tích tham khảo."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
