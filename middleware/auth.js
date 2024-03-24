import jwt from 'jsonwebtoken'

const jwtSecret = process.env.JWT_SECRET

const auth = (req, res, next) => {
  const token = req.header('x-auth-token')
  try {
    const token = req.headers.authorization.split(' ')[1]
    const isCustomAuth = token.length < 500

    let decodedData

    if(token && isCustomAuth) {
      decodedData = jwt.verify(token, `${jwtSecret}`)
      req.userId = decodedData?.id
    } else {
      decodedData = jwt.decode(token)
      req.userId = decodedData?.sub
    }
    next()
  } catch (error) {
    console.log(error)
  }
}

export default auth