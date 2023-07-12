import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Moment from 'App/Models/Moment'
import { v4 as uuidv4 } from 'uuid'
import Application from '@ioc:Adonis/Core/Application'

export default class MomentsController {
  private validationOptions = {
    types: ['image'],
    size: '2mb',
  }

  public async store({ request, response }: HttpContextContract) {
    const body = request.body()
    const moment = await Moment.create(body)
    const image = request.file('image', this.validationOptions)

    if (image) {
      const imageName = `${uuidv4()}.${image.extname}`
      await image.move(Application.tmpPath('uploads'), { name: imageName })
      body.image = imageName
    }

    response.status(201)
    return {
      message: 'Moment created',
      data: moment,
    }
  }

  public async index({ response }: HttpContextContract) {
    const moments = await Moment.all()
    response.status(200)
    return {
      data: moments,
    }
  }

  public async show({ params, response }: HttpContextContract) {
    const moment = await Moment.findOrFail(params.id)
    response.status(200)
    return {
      data: moment,
    }
  }

  public async update({ params, request, response }: HttpContextContract) {
    const body = request.body()
    const moment = await Moment.findOrFail(params.id)
    moment.merge(body)

    if (moment.image !== body.image || !moment.image) {
      const image = request.file('image', this.validationOptions)
      if (image) {
        const imageName = `${uuidv4()}.${image.extname}`
        await image.move(Application.tmpPath('uploads'), { name: imageName })
        moment.image = imageName
      }
    }

    await moment.save()
    response.status(200)
    return {
      message: 'Moment updated',
      data: moment,
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    const moment = await Moment.findOrFail(params.id)
    await moment.delete()
    response.status(200)
    return {
      message: 'Moment deleted',
    }
  }
}
