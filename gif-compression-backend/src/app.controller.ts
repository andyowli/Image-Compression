import { Controller, Get, Post, Res, UploadedFile, UseInterceptors, Query, ParseIntPipe, BadRequestException} from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { existsSync } from 'fs';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    dest: 'uploads'
  }))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log('file', file);
    return file.path;
  }

  @Get('compression')
  async compression(
      @Query('path') filePath: string,
      @Query('color', ParseIntPipe) color:number,
      @Query('level', ParseIntPipe) level: number,
      @Res() res: Response
  ) {
      if(!existsSync(filePath)) {  //existsSync 同步检查给定路径中是​​否已存在文件
        throw new BadRequestException('文件不存在');
      }

      const sharp = require('sharp');

      const data = await sharp(filePath, {
        animated: true, //读取所有的帧，不然默认只会读取 gif 的第一帧
        limitInputPixels: false //设为 false 是不限制大小，默认太大的图片是会报错
      }).gif({
        compressionLevel: level, //压缩级别，数字越大图片压缩程度越高，默认是 6
        colours: color //颜色的数量，默认是 256
      }).toBuffer();

      res.set('Content-Disposition', `attachment; filename="dest.gif"`);

      res.send(data);
  }


  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
