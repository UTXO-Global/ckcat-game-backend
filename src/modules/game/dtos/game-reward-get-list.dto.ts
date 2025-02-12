import { Expose, Transform } from "class-transformer";
import { BaseReqDTO } from "../../../base/base.dto";
import { IsOptional } from "class-validator";


export class GameRewardGetListReqDTO extends BaseReqDTO {
    @Expose()
    @IsOptional()
    @Transform(({ value }) => Number(value)) 
    limitNumber: number;
}
