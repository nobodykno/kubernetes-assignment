import bcrypt from 'bcryptjs';

export async function bcryptJob(rounds: number): Promise<string> {
  const password = `password-${Math.random().toString(36).slice(2)}`;
  const hash = await bcrypt.hash(password, rounds);
  return hash;
}
