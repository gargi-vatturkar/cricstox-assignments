import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AddContactComponent } from '../add-contact/add-contact.component';
import { UserService } from '../http/user.service';

@Component({
  selector: 'app-list-contact',
  templateUrl: './list-contact.component.html',
  styleUrls: ['./list-contact.component.scss']
})
export class ListContactComponent implements OnInit {

  //https"//jsonmock.hackerrank.com/api/transactions?userId=1/2/3/4&page=
  user;
  contactList = [];
  searchText = "";

  showLoader = false;

  //sort options
  sortOptions = {
    selected: "date_old", list: [
      { id: "date_old", label: "Sort by Date added: Oldest to Newest" },
      { id: "date_new", label: "Sort by Date added: Newest to Oldest" },
      { id: "name_low", label: "Sort by Name: A - Z" },
      { id: "name_high", label: "Sort by Name: Z - A" }
    ]
  }

  constructor(private dialog: MatDialog, private service: UserService,
    private router: Router) { }

  ngOnInit(): void {
    //get user from session storage
    this.showLoader = true;
    this.user = JSON.parse(sessionStorage.getItem("directoryUser"));

    if (this.user)
    //get all contacts by user id
      this.service.getContacts(this.user["id"]).subscribe(res => {
        this.showLoader = false;

        if (res.message.indexOf("succes") > -1) {

          //default sorting by oldest to newest
          this.contactList = res.contacts.contacts.sort((a, b) => {
            if (a.date_added > b.date_added) return 1;
            else if (a.date_added < b.date_added) return -1;
            else return 0;
          });

          //add default image if image not present
          this.contactList.forEach(ele => {
            if(!ele.photoUrl) ele.photoUrl= "assets/user.png";
          })
        }
      });
  }

  addContact() {
    let ref = this.dialog.open(AddContactComponent, {data: { screen: "add" }});
    ref.afterClosed().subscribe(res => {
      this.ngOnInit();
    });
  }

  clearSearch() {
    if (this.searchText.length > 0) this.searchText = "";
  }

  onClickDelete(id) {
    this.service.deleteContact(this.user["id"], id).subscribe(res => {
      this.ngOnInit();
    })
  }

  onContactClick(contact){
    //view contact details
    this.service.storeContact(contact["_id"]);
    this.router.navigate(["/details"]);
  }

}
