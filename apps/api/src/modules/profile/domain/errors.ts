export class ProfileError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number
  ) {
    super(message)
    this.name = 'ProfileError'
  }

  static introNotFound(): ProfileError {
    return new ProfileError('User intro not found', 'INTRO_NOT_FOUND', 404)
  }

  static alreadyCompleted(): ProfileError {
    return new ProfileError('Intro already completed', 'INTRO_ALREADY_COMPLETED', 409)
  }
}
