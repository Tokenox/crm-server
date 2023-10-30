import { Inject, Injectable } from "@tsed/di";
import { CategoryModel } from "../models/CategoryModel";
import { CategoryBodyTypes } from "types";
import { LeadService } from "./LeadService";
import { MongooseModel } from "@tsed/mongoose";

@Injectable()
export class CategoryService {
  constructor(
    @Inject(CategoryModel) private category: MongooseModel<CategoryModel>,
    private leadService: LeadService
  ) {}

  public async findCategories({ orgId }: { orgId: string }) {
    return await this.category.find({ orgId });
  }

  public async findCategoryById(id: string) {
    return await this.category.findById(id);
  }

  public async findCategoryIdsByOrgId(orgId: string) {
    return await this.category.find({ orgId }).select({ _id: true });
  }

  public async createCategory({ name, description, fields, orgId, adminId }: CategoryBodyTypes) {
    return await this.category.create({ name, description, orgId, adminId, fields });
  }

  public async updateCategory({ id, name, description }: CategoryBodyTypes & { id: string }) {
    return await this.category.findByIdAndUpdate(id, { name, description });
  }

  public async deleteCategory(id: string) {
    await this.leadService.deleteLeadsByCategoryId(id);
    return await this.category.deleteOne({ _id: id });
  }

  public async findCategory() {
    return await this.category.findOne();
  }

  public async findCategoryByNameAndOrgId({ name, orgId }: { name: string; orgId: string }) {
    return await this.category.findOne({ name, orgId });
  }
}
