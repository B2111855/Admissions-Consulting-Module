// src/services/paginator.ts
class Paginator {
    public limit: number;
    public page: number;
    public offset: number;

    constructor(page: number | string = 1, limit: number | string = 5) {
        this.limit = parseInt(limit as string, 10);
        if (isNaN(this.limit) || this.limit < 1) {
            this.limit = 5;
        }

        this.page = parseInt(page as string, 10);
        if (isNaN(this.page) || this.page < 1) {
            this.page = 1;
        }

        this.offset = (this.page - 1) * this.limit;
    }

    // ĐẢM BẢO PHƯƠNG THỨC NÀY ĐÃ ĐƯỢC THÊM VÀO
    public paginate<T>(data: T[], currentPage: number, perPage: number) {
        const offset = (currentPage - 1) * perPage;
        const paginatedItems = data.slice(offset, offset + perPage);

        return {
            page: currentPage,
            perPage: perPage,
            total: data.length,
            totalPages: Math.ceil(data.length / perPage),
            data: paginatedItems,
        };
    }

    public getMetadata(totalRecords: number): {
        totalRecords?: number;
        firstPage?: number;
        lastPage?: number;
        page?: number;
        limit?: number;
    } {
        if (totalRecords === 0) {
            return {};
        }

        const totalPages = Math.ceil(totalRecords / this.limit);

        return {
            totalRecords,
            firstPage: 1,
            lastPage: totalPages,
            page: this.page,
            limit: this.limit,
        };
    }
}

export default Paginator;