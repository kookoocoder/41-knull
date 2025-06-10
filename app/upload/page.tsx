import { redirect } from "next/navigation"

export default function UploadPage() {
  // Redirect to the main page since upload functionality is integrated there
  redirect("/")
}
