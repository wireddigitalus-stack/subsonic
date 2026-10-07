import { redirect } from "next/navigation";

export default function ShooterIntakePage() {
  // Official competitor profile intake requires a VIP invitation code.
  redirect("/invite/pro");
}
