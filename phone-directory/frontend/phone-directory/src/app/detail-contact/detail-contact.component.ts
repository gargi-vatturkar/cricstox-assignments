import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddContactComponent } from '../add-contact/add-contact.component';
import { UserService } from '../http/user.service';
import * as d3 from 'd3';
import * as d3Scale from 'd3';
import * as d3Shape from 'd3';
import * as d3Array from 'd3';
import * as d3Axis from 'd3';

@Component({
  selector: 'app-detail-contact',
  templateUrl: './detail-contact.component.html',
  styleUrls: ['./detail-contact.component.scss']
})
export class DetailContactComponent implements OnInit {

  user;
  contact;
  contactId;
  viewsByDay;

  dimensions = { width: 900, height: 500 }

  //for view chart
  private margin = { top: 30, right: 20, bottom: 30, left: 150 };
  private width: number;
  private height: number;
  private x: any;
  private y: any;
  private svg: any;
  private line: d3Shape.Line<[any, number]>;

  constructor(private service: UserService, private dialog: MatDialog) {
    this.width = 960 - this.margin.left - this.margin.right;
    this.height = 500 - this.margin.top - this.margin.bottom;
  }

  ngOnInit(): void {
    this.user = JSON.parse(sessionStorage.getItem("directoryUser"));

    if (this.user) {
      this.contactId = sessionStorage.getItem("viewContact"); //JSON.parse(

      this.service.getContactById(this.user["id"], this.contactId).subscribe(res => {
        if (res.contact.contacts && res.contact.contacts.length > 0) {
          this.contact = res.contact.contacts[0];
          this.contact["detailList"] = [];

          this.contact["photoUrl"] = this.contact.photoUrl ? this.contact.photoUrl : "assets/user.png";
          this.populateDetailList();
        }
      });
    }
  }

  ngAfterViewInit() {
    //this.setChartSize();
  }

  populateDetailList() {
    this.contact.detailList = [];
    if (this.contact.mobile)
      this.contact.detailList.push({ title: "Mobile", value: this.contact.mobile });
    if (this.contact.landline)
      this.contact.detailList.push({ title: "Landline", value: this.contact.landline });
    if (this.contact.email)
      this.contact.detailList.push({ title: "Email", value: this.contact.email });

    this.contact.views.forEach(element => {
      element["formatted"] = new Date(2021, element["viewed_date"].split("-")[1], element["viewed_date"].split("-")[0], 0, 0, 0, 0);
    });

    this.contact.views = this.contact.views.sort((a, b) => {
      if (a["formatted"] > b["formatted"]) return 1;
      else if (a["formatted"] < b["formatted"]) return -1;
      else return 0;
    });

    if (this.contact.views.length > 1) {
      this.setChartSize();
    }
    else
      this.svg = d3.selectAll("svg").style("display", "none");
  }


  onClickEdit(contact) {
    this.service.storeContact(contact["_id"]);
    let ref = this.dialog.open(AddContactComponent, { data: { screen: "edit", contact: contact } });

    ref.afterClosed().subscribe(res => {
      //this.ngOnInit(); update data from form, dont hit get as it will increase views
      if (res.contact) {
        this.contact.first_name = res.contact.first_name;
        this.contact.middle_name = res.contact.middle_name;
        this.contact.last_name = res.contact.last_name;
        this.contact.email = res.contact.email;
        this.contact.mobile = res.contact.mobile;
        this.contact.landline = res.contact.landline;
        this.contact.notes = res.contact.notes;
        this.contact.date_edited = res.contact.date_edited;
        this.contact.photoUrl = res.url;
        this.populateDetailList();

      }

    });
  }

  private buildSvg() {
    this.svg = d3.selectAll("svg") // svg element from html
      .append('g')   // appends 'g' element for graph design
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')
      .attr('width', this.dimensions.width);
  }

  private addXandYAxis() {
    // range of data configuring
    this.x = d3Scale.scaleTime().range([0, this.width]);
    this.y = d3Scale.scaleLinear().range([this.height, 0]);
    this.x.domain(d3Array.extent(this.contact.views, (d) => d["formatted"]));
    this.y.domain(d3Array.extent(this.contact.views, (d) => d["frequency"]));
    // Configure the X Axis
    this.svg.append('g')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(d3Axis.axisBottom(this.x));
    // Configure the Y Axis
    this.svg.append('g')
      .attr('class', 'axis axis--y')
      .attr('width', this.dimensions.width)
      .call(d3Axis.axisLeft(this.y));
  }

  private drawLineAndPath() {
    this.line = d3Shape.line()
      .x((d: any) => this.x(d["formatted"]))
      .y((d: any) => this.y(d["frequency"]));
    // Configuring line path
    this.svg.append('path')
      .datum(this.contact.views)
      .attr('class', 'line')
      .attr('d', this.line)
      .style('fill', 'none')
      .style('stroke', 'red')
      .style('stroke-width', '2px');
  }

  @HostListener("window:resize")
  setChartSize() {
    let outerEle = document.querySelector(".details-cls");
    this.dimensions.width = outerEle.clientWidth - 96;
    console.log(this.dimensions)
    // this.dimensions.height = 500;

    if (document.documentElement.clientWidth <= 768)
      this.margin.left = 56;
    else
      this.margin.left = 128;

    d3.selectAll("svg > *").remove();
    this.buildSvg();
    this.addXandYAxis();
    this.drawLineAndPath();
  }

}
