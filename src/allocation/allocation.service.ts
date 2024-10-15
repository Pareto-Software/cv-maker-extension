import { Injectable } from '@nestjs/common';
import { SheetService } from '../sheet/sheet.service';

@Injectable()
export class AllocationService {
  constructor(private readonly sheetService: SheetService) {}
  // Do functions that transform sheet data here
}
