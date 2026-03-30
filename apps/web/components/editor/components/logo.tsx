import { FileText } from "lucide-react"
import Link from "next/link"

export const Logo = () => {
  return (
    <Link href="/">
      <div className="flex items-center gap-x-2 shrink-0 hover:opacity-75 transition">
        <FileText className="size-6" />
        <span className="font-semibold text-lg">Paperly</span>
      </div>
    </Link>
  )
}
