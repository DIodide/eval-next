import { SignUp } from '@clerk/nextjs'

export default function LeagueSignUpPage() {
  return (
    <div className="flex justify-center items-center h-screen">
      <SignUp unsafeMetadata={{userType: "league"}}/>
    </div>
  )
} 