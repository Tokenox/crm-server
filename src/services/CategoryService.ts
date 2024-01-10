import { Inject, Injectable } from "@tsed/di";
import { CategoryModel } from "../models/CategoryModel";
import { CategoryBodyTypes, FieldTypes } from "types";
import { LeadService } from "./LeadsService";
import { MongooseModel } from "@tsed/mongoose";

@Injectable()
export class CategoryService {
  constructor(
    @Inject(CategoryModel) private category: MongooseModel<CategoryModel>,
    private leadService: LeadService
  ) {}

  //! Find
  public async findCategories() {
    return await this.category.find();
  }

  public async findCategoryById(id: string) {
    return await this.category.findById(id);
  }

  public async findCategoryByName(name: string) {
    return await this.category.findOne({
      name: { $regex: new RegExp(name, "i") }
    });
  }

  //! Create
  public async createCategory({ name, description, saleRepId }: CategoryBodyTypes) {
    return await this.category.create({ name: name.toLocaleLowerCase(), description, saleRepId });
  }

  //! Update
  public async updateCategory({ id, name, description }: CategoryBodyTypes & { id: string }) {
    return await this.category.findByIdAndUpdate(
      {
        _id: id
      },
      { name: name.toLocaleLowerCase(), description, updatedAt: Date.now() }
    );
  }

  //! Delete
  public async deleteCategory(id: string) {
    await this.leadService.deleteLeadsByCategoryId(id);
    return await this.category.deleteOne({ _id: id });
  }
}
