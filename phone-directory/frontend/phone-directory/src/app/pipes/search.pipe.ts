import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'search'
})
export class SearchPipe implements PipeTransform {

  transform(value: any, searchText: any, sortOption: any): unknown {
    if (!value) return null;
    if (!searchText && !sortOption) return value;

    searchText = searchText.toLowerCase();

    //add empty strings if values not present
    value.map(item => {
      if (!item.first_name) item.first_name = "";
      if (!item.last_name) item.last_name = "";
      if (!item.middle_name) item.middle_name = "";
      if (!item.mobile) item.mobile = "";
      if (!item.landline) item.landline = "";
    });

    //filter based on search key
    let filtered = value.filter(item =>
      item.first_name.toLowerCase().includes(searchText) || item.middle_name.toLowerCase().includes(searchText) ||
      item.last_name.toLowerCase().includes(searchText) || String(item.landline).includes(searchText) ||
      String(item.mobile).includes(searchText)
    );

    //sort based on sortOption
    //date_old: Sort by Date added: Oldest to Newest, date_new: Sort by Date added: Newest to Oldest,
    //name_low: "Sort by Name: A - Z, name_high: Sort by Name: Z - A
    switch (sortOption) {
      case "date_old":
        filtered = filtered.sort((a, b) => {
          if (a.date_added > b.date_added) return 1;
          else if (a.date_added < b.date_added) return -1;
          else return 0;
        });
        break;
      case "date_new":
        filtered = filtered.sort((a, b) => {
          if (a.date_added > b.date_added) return -1;
          else if (a.date_added < b.date_added) return 1;
          else return 0;
        });
        break;
      case "name_low":
        filtered = filtered.sort((a, b) => {
          if (a.first_name + a.middle_name + a.last_name > b.first_name + b.middle_name + b.last_name) return 1;
          else if (a.first_name + a.middle_name + a.last_name < b.first_name + b.middle_name + b.last_name) return -1;
          else return 0;
        });
        break;
      case "name_high":
        filtered = filtered.sort((a, b) => {
          if (a.first_name + a.middle_name + a.last_name > b.first_name + b.middle_name + b.last_name) return -1;
          else if (a.first_name + a.middle_name + a.last_name < b.first_name + b.middle_name + b.last_name) return 1;
          else return 0;
        });
        break;
    }

    return filtered;
  }

}