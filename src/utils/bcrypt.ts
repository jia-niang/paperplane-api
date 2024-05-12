import bcrypt from 'bcrypt'

export async function bcryptHash(password: string) {
  return await bcrypt.hash(password, 5)
}

export async function bcryptCompare(password: string, hash: string) {
  return await bcrypt.compare(password, hash)
}
