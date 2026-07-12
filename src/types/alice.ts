/** Alice (EaDStock) types — rents catalog + launch. */

export type AliceRent = {
  id: number
  hash: string
  urlCompleta: string
  nomeUnidade: string
  contentId: string
}

export type AliceDisciplineRents = {
  disciplineId: number
  disciplineName: string
  rents: AliceRent[]
}

export type AliceLaunchUser = {
  userId: string
  fullName: string
  email: string
}
