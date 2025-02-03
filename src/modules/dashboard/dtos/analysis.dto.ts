import { Expose } from 'class-transformer'

export class AnalysisDTO {
    @Expose()
    activeUsers: Array<AnalysisDTO>

    @Expose()
    createdUsers: Array<AnalysisDTO>
}

export class AnalysisItemDTO {
    @Expose()
    date: Date

    @Expose()
    numOfUsers: number
}
