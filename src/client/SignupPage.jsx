import { Link } from 'react-router-dom'

import { SignupForm } from '@wasp/auth/forms/Signup.tsx'

const SignupPage = ({user}) => {
  return (
    <>
      <SignupForm/>
      <br/>
      <span>
        I already have an account (<Link to="/login">go to login</Link>).
      </span>
    </>
  )
}

export default SignupPage