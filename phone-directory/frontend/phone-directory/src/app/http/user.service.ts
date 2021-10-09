import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  //base = "http://localhost:3001/directory";
  base = "http://directory-env-1.eba-bgz8fhkv.us-east-2.elasticbeanstalk.com/directory";
  user = { username: "", password: "", id: "" }

  constructor(private http: HttpClient) { }

  //login
  getUser(requestBody): Observable<any> {
    return this.http.post(this.base + "/login", requestBody);
  }

  //store user in session storage
  storeUser(username, password, id) {
    this.user = { username: username, password: password, id: id }
    sessionStorage.setItem("directoryUser", JSON.stringify(this.user))
  }

  //add contact to user, sending data using formdata, all data in field "data", and contact image in "photo"
  addContact(id, contact, photo){
    let requestBody = {id: id, contact: contact};
    const cont = new FormData();
    cont.append("data", JSON.stringify(requestBody));

    if(photo)
    cont.append("photo", photo);

    return this.http.post(this.base + "/add", cont);
  }

  //update contact by id, sending data using formdata, all data in field "data", and contact image in "photo"
  updateContact(userid, id, contact, photo){
    const cont = new FormData();
    cont.append("data", JSON.stringify(contact));

    if(photo)
    cont.append("photo", photo);

    return this.http.put(this.base + "/update-contact/" + userid + "/" + id, cont);
  }

  //get all contacts of logged in user by id
  getContacts(id): Observable<any>{
    return this.http.get(this.base + "/get/" + id);
  }

  //delete contact by id
  deleteContact(userId, contactId): Observable<any>{
    return this.http.delete(this.base + "/delete-contact/" + userId + "/" + contactId);
  }

  //store contact-id in session storage for viewing details
  storeContact(contact){
    sessionStorage.setItem("viewContact", contact);
  }

  //get contact of logged in user by id
  getContactById(userId, id): Observable<any>{
    return this.http.get(this.base + "/get-contact/" + userId + "/" + id);
  }
}
