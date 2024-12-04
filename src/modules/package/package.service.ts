import { Service } from 'typedi'
import { Package } from './entities/package.entity'

@Service()
export class PackageService {
    async getPackages() {
        return await Package.getPackages()
    }
}
