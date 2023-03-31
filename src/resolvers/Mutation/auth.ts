import { Context } from "../../index";
import { User } from ".prisma/client";
import validator from "validator";
import bcrypt from "bcryptjs";

interface SignupArgs {
  email: string,
  name: string,
  password: string,
  bio: string
}

interface UserPayload {
  userErrors: {
    message: string
  }[],
  user: User | null
}

export const authResolvers = {
  signup: async (
    _: any,
    {email, name, password, bio}: SignupArgs,
    { prisma }: Context
  ): Promise<UserPayload> => {
    const isEmail = validator.isEmail(email)
    if (!isEmail) {
      return {
        userErrors: [
          {
            message: "Invalid email"
          }
        ],
        user: null
      }
    }

    const isValidPassword = validator.isLength(password, {
      min: 5
    })

    if (!isValidPassword) {
      return {
        userErrors: [
          {
            message: "Invalid password"
          }
        ],
        user: null
      }
    }

    if (!name || !bio) {
      return {
        userErrors: [
          {
            message: "Invalid name or bio"
          }
        ],
        user: null
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword
      }
    })

    return {
      userErrors: [],
      user: newUser
    }
  },
}