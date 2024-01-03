import { Inject, Injectable } from "@tsed/di";
import { CategoryFieldType, CategoryModel } from "../models/CategoryModel";
import { CategoryBodyTypes, FieldTypes } from "types";
import { LeadService } from "./LeadService";
import { MongooseModel } from "@tsed/mongoose";

@Injectable()
export class CategoryService {
  constructor(
    @Inject(CategoryModel) private category: MongooseModel<CategoryModel>,
    private leadService: LeadService
  ) {}

  public async findCategories() {
    return await this.category.find();
  }

  public async findCategoryById(id: string) {
    return await this.category.findById(id);
  }

  public async findCategoryIdsByOrgId(orgId: string) {
    return await this.category.find({ orgId }).select({ _id: true });
  }

  public async createCategory({ name, description, fields, orgId, adminId }: CategoryBodyTypes) {
    return await this.category.create({ name: name.toLocaleLowerCase(), description, orgId, adminId, fields });
  }

  public async updateCategory({ id, name, description }: CategoryBodyTypes & { id: string }) {
    return await this.category.findByIdAndUpdate(id, { name: name.toLocaleLowerCase(), description });
  }

  public async deleteCategory(id: string) {
    await this.leadService.deleteLeadsByCategoryId(id);
    return await this.category.deleteOne({ _id: id });
  }

  public async findCategory() {
    return await this.category.findOne();
  }

  public async findCategoryByName(name: string) {
    return await this.category.findOne({
      name: { $regex: new RegExp(name, "i") }
    });
  }

  public async findCategoryByNameAndOrgId({ name, orgId }: { name: string; orgId: string }) {
    return await this.category.findOne({ name, orgId });
  }

  public async addFieldsToCategory({ id, fields }: { id: string; fields: FieldTypes[] }) {
    return await this.category.findByIdAndUpdate(id, { $push: { fields: { $each: fields } } });
  }
}
