import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const bcrypt = require('bcryptjs')
const { Pool } = require('pg')

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function main() {
  const client = await pool.connect()
  try {
    // Modo emergência: resetar senha
    const resetPassword = process.env.RESET_ADMIN_PASSWORD
    if (resetPassword) {
      const hash = await bcrypt.hash(resetPassword, 12)
      const resetUser = process.env.RESET_ADMIN_USERNAME || 'admin'
      const { rowCount } = await client.query(
        `UPDATE "User" SET "passwordHash" = $1 WHERE username = $2`,
        [hash, resetUser]
      )
      if (rowCount > 0) {
        console.log(`Senha do usuário "${resetUser}" resetada.`)
      } else {
        console.log(`Usuário "${resetUser}" não encontrado.`)
      }
      return
    }

    // Criar admin inicial apenas se banco vazio
    const { rows } = await client.query('SELECT id FROM "User" LIMIT 1')
    if (rows.length > 0) {
      console.log('Usuários já existem, seed pulado.')
      return
    }

    const username = process.env.ADMIN_USERNAME || 'admin'
    const password = process.env.ADMIN_PASSWORD || 'Admin@123456'
    const hash = await bcrypt.hash(password, 12)

    await client.query(
      `INSERT INTO "User" (id, username, "displayName", email, "passwordHash", role, "joinedAt")
       VALUES ($1, $2, $3, $4, $5, 'admin', NOW())`,
      [`seed_${Date.now()}`, username, 'Administrador', 'admin@afdm.com.br', hash]
    )
    console.log(`Admin criado: ${username}`)
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch((e) => {
  console.error('Seed error:', e.message)
  process.exit(0)
})
