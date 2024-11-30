import React, { useState, useEffect, useRef } from "react";
import {
  Toolbar,
  Grid,
  Button,
  Card,
  makeStyles,
  CardContent,
  DialogContent,
  Avatar,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { GlobalHeader } from "components/navigation/components/GlobalHeader";
import CustomInput from "components/custom/CustomInput";
import KisshtTable from "components/table/KisshtTable";
import { BootstrapBadge } from "components/ui/BootstrapBadge";
import { IsEmpty, getQueryParam, readableFormatDate } from "shared/utils";
import Header from "components/navigation/Header";
import {
  createpartnershipmatrix,
  getPartnershipList,
  updatePartnershipDetails,
} from "shared/api/partnership";
import { KisshtDialog } from "components/custom/KisshtDialog";
import BulkUpload from "pages/Loans/dialog/bulkupload";
import Editablepartnership from "./Editpartnership";
import CreatePartner from "./AddPartnership/AddPartnership";
import { AddCircle, Edit, Search } from "@material-ui/icons";
import RefreshIcon from "./../../assets/images/new-ui-changes-icons/refresh-ccw.svg";
import CustomSelectNewDesign from "components/ui/new-design/CustomSelectNewDesign";
import ResposiveNewDesignMenu from "components/ui/new-design/ResposiveNewDesignMenu";
import ButtonV2 from "components/ui/new-design/ButtonV2";
import InfoAlert from "components/ui/new-design/InfoAlert";
const editableColumns = [
  "status",
  "business_type",
  "auth_client_reference_number",
  "company_name",
  "company_url",
  "image_url",
  "email",
  "contact_number",
  "office_phone_number_1",
  "address_line1",
  "address_line2",
  "city",
  "state",
  "pincode",
  "extra_info",
  "status_changed_comment",
];

const requiredColumns = [
  "status",
  "business_type",
  "auth_client_reference_number",
  "company_name",
  "email",
  "contact_number",
  "address_line1",
  "city",
  "state",
  "pincode",
  "status_changed_comment",
];

const useStyles = makeStyles((theme) => ({
  table: {
    borderRadius: "5px",
    "& .MuiTableCell-root": {
      borderBottom: "none",
    },
  },
  card: {
    "& .MuiCardHeader-root": {
      padding: "12px",
      paddingBottom: 0,
    },
  },
  "& .MuiPagination-root": {
    textAlign: "center",
  },
  tex_title: {
    marginBottom: "1.3rem",
    color: "#14171A",
    fontWeight: "bold",
  },
  dataHolder:{
    "& .MuiPaper-elevation1":{
      boxShadow:"none",
    },
    "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":{
      borderColor:"#1D44E9 !important",
    },
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":{
      borderColor:"#1D44E9 !important",
    },
    "& .MuiRadio-colorPrimary.Mui-checked":{
      color:"#1D44E9 !important",
    },
    "& .MuiInputLabel-root.Mui-focused":{
      color:"#1D44E9",
    }
  },
}));
const items = [
  {
    reason: "ONBOARDING_TYPE",
    name: "Upload Bulk Merchant Onboarding type",
    module: "PARTNERS",
  },
];

export const Partnership = (props) => {
  const { params, updateQueryParams, delteQueryParams } = props;
  const classes = useStyles();
  const [spinning, setSpinning] = useState(false);
  const [isEditSubmitting, setEditSubmitting] = useState(false);
  const [editableRow, setEditableRow] = useState(null);
  const [partnership, setPartnership] = useState([]);
  const { page_no } = props.params;
  const [offset, setoffset] = useState(Number(page_no) || 1);
  const [search, setSearch] = useState(params["search"] || "");
  const [selected, setSelected] = useState(params["selected"] || "");
  const [status, setStatus] = useState(params["status"] || "");
  const [reload, setreload] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openPartnerModal, setOpenPartnerModal] = useState(false);
  const [resultsPerPage, setResultsPerPage] = useState("20");
  const total_count = useRef(0);
  const [model, setmodel] = useState(false);
  const selectedMenu = useRef(null);
  const isMounted = useRef(null);

  const fetchPartnershipListing = async () => {
    let param = getParam();
    if (param) {
      await updateQueryParams({
        page_no: JSON.stringify(offset),
        status,
        selected,
        search,
        limit: resultsPerPage,
      });
      setSpinning(true);
      getPartnershipList(param)
        .then((res) => {
          console.log(res);
          setSpinning(false);
          setPartnership([]);
          if (res.hasOwnProperty("success") && res.success) {
            const { data } = res;
            console.log({ data });
            if (
              data &&
              data.hasOwnProperty("partnership_listing") &&
              data.partnership_listing.length > 0
            ) {
              total_count.current = data.total_count;
              setPartnership(data.partnership_listing);
            } else {
              setPartnership([]);
            }
          }
        })
        .catch((error) => {
          total_count.current = 0;
          setPartnership([]);
          setSpinning(false);
        });
    }
  };

  const getParam = (_) => {
    const param = getQueryParam({
      status,
      selected,
      search,
      offset: offset + "",
      limit: resultsPerPage,
    });
    return param ? param : "";
  };

  const handleSelect = async (e) => {
    e.persist();
    if (e) {
      let item = e.target.value;
      if (!item) {
        await setSearch("");
        await delteQueryParams();
      }
      setSelected(item);
    }
  };

  const handleStatus = async (e) => {
    e.persist();
    if (e) {
      let item = e.target.value;
      if (!item) {
        await setStatus("");
      } else {
        await setStatus(item);
      }
      isMounted.current = true;
      await setreload(!reload);
    }
  };

  const handleEditableRow = (cell) => {
    console.log({ cell });
    const rowData = cell.row?._original;
    setEditableRow(rowData);
    setOpenModal(true);
  };

  const handleEditableModelClose = (e) => {
    setOpenModal(false);
    setEditableRow(null);
  };

  useEffect(() => {
    if (isMounted.current) {
      fetchPartnershipListing();
    }
  }, [reload, resultsPerPage]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (selected && search) {
      isMounted.current = true;
      await setoffset(1);
      await setreload(!reload);
    }
  };

  const refreshHandler = async (_) => {
    await setoffset(1);
    await setSearch("");
    await setPartnership([]);
    await setSelected("");
    await setStatus("");
    await delteQueryParams();
  };

  const onResultsPerPageChange = (val) => {
    setResultsPerPage(val);
  };

  const columns = React.useMemo(() => [
    {
      Header: "Partner Ref No",
      accessor: "partner_reference_number",
      sortable: true,
      Cell: (cell) => {
        return (
          <IsEmpty
            itemKey={cell.original}
            value="partner_reference_number"
          ></IsEmpty>
        );
      },
      filterable: false,
    },
    {
      Header: "Authclient Ref No",
      accessor: "auth_client_reference_number",
      filterable: false,
      sortable: false,
      Cell: (cell) => {
        return (
          <>
            <span>{cell.value}</span>
            <span className="pl-2">
              {cell.original.last_name ? `${cell.original.last_name}` : null}
            </span>
          </>
        );
      },
    },
    {
      Header: "Company Name",
      accessor: "company_name",
      sortable: false,
      filterable: false,
      Cell: (cell) => (
        <IsEmpty itemKey={cell.original} value="company_name"></IsEmpty>
      ),
    },

    {
      Header: "Business Type",
      accessor: "business_type",
      filterable: false,
      sortable: false,
      Cell: (cell) => {
        return (
          <IsEmpty itemKey={cell.original} value="business_type"></IsEmpty>
        );
      },
    },
    {
      Header: "Email",
      accessor: "email",
      filterable: false,
      sortable: false,
      Cell: (cell) => <IsEmpty itemKey={cell.original} value="email"></IsEmpty>,
    },
    {
      Header: "Contact Number",
      accessor: "contact_number",
      filterable: false,
      sortable: true,
      Cell: (cell) =>
        cell.value ? (
          <span>{"xxxxxx" + cell.value.toString().substring(6, 10)}</span>
        ) : (
          <span>-</span>
        ),
    },
    {
      Header: "Status",
      accessor: "status",
      filterable: false,
      Cell: (cell) => {
        return <BootstrapBadge text={cell.value} />;
      },
    },
    {
      Header: "Created Date",
      accessor: "created_at",
      Cell: (cell) => {
        return readableFormatDate(cell.value);
      },
      filterable: false,
    },

    {
      Header: "Actions",

      Cell: (cell) => {
        return (
          <>
            <ButtonV2
              variant="contained"
              className="shadow-none"
              color="primary"
              startIcon={<Edit />}
              onClick={handleEditableRow.bind(null, cell)}
            >
              Edit
            </ButtonV2>
          </>
        );
      },
    },
  ]);

  const onPageChange = async (value) => {
    await updateQueryParams({
      page_no: JSON.stringify(value),
      status,
      selected,
      search,
    });
    await setoffset(value);
    await setreload(!reload);
  };

  const handleRowEdit = (values) => {
    console.log({ values });

    const payload = {
      partner_reference_number: values.partner_reference_number,
      address_line1: values.address_line1,
      address_line2: values.address_line2,
      auth_client_reference_number: values.auth_client_reference_number,
      business_type: values.business_type,
      company_name: values.company_name,
      company_url: values.company_url,
      contact_number: values.contact_number,
      email: values.email,
      image_url: values.image_url,
      extra_info: values.extra_info,
      pincode: values.pincode,
      office_phone_number_1: values.office_phone_number_1,
      status_changed_comment: values.status_changed_comment,
      state: values.state,
      city: values.city,
      status: values.status,
      is_pin_verification_enabled: values.is_pin_verification_enabled,
      remote_ip: values.remote_ip,
      salt: values.salt,
      webhook_url: values.webhook_url,
      success_url: values.success_url,
      error_url: values.error_url,
      is_webhook_enabled: values.is_webhook_enabled,
    };

    setEditSubmitting(true);
    updatePartnershipDetails({}, payload)
      .then((res) => {
        if (res.hasOwnProperty("success") && res.success) {
          const { data } = res;
          console.log({ data });
          fetchPartnershipListing();
          setOpenModal(false);
          setEditSubmitting(false);
          console.log(res);
        }
      })
      .catch((error) => {
        // setOpenModal(false);
        setEditSubmitting(false);
        console.log(error);
      });
  };

  const handleAddPartner = () => {
    setOpenPartnerModal(true);
  };

  const handleAddPartnerClose = () => {
    setOpenPartnerModal(false);
  };

  const handleCreatePartner = (values) => {
    console.log({ create: values });
    const payload = {
      ...values,
    };
    setEditSubmitting(true);
    createpartnershipmatrix({}, payload)
      .then((res) => {
        setEditSubmitting(false);

        if (res.hasOwnProperty("success") && res.success) {
          setOpenPartnerModal(false);
          fetchPartnershipListing();
          const { data } = res;
          console.log({ data });
          console.log(res);
        }
      })
      .catch((error) => {
        // setOpenPartnerModal(false);
        setEditSubmitting(false);

        console.log(error);
      });
  };

  return (
    <>
      <Header open={props.open}>
        <Toolbar
          style={{
            backgroundColor: "#FFFFFF",
          }}
        >
          <GlobalHeader />
        </Toolbar>
      </Header>

      <Toolbar>
        <Grid container alignItems="center">
          <Grid item xs={10}>
            <Grid item className={classes.tex_title}>
              <p>Partnership</p>
            </Grid>
            <Grid container spacing={1} alignItems="center">
              <CustomSelectNewDesign
                onChange={handleStatus}
                nulloption="Select Status"
                value={status}
                options={{
                  ACTIVE: "ACTIVE",
                  INACTIVE: "INACTIVE",
                  SUSPENDED: "SUSPENDED",
                }}
              />
              <Grid item>
                <CustomSelectNewDesign
                  onChange={handleSelect}
                  nulloption="Search By"
                  value={selected}
                  options={{
                    partner_reference_number: " Partner Reference No",
                    auth_client_reference_number: "Auth client Refrence No",
                  }}
                />
              </Grid>
              <Grid item>
                <CustomInput
                  placeholder="Search"
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => e.key == "Enter" && handleSearch(e)}
                  value={search}
                />
              </Grid>
              <Grid item>
                <ButtonV2
                  startIcon={<Search />}
                  disabled={spinning}
                  variant="contained"
                  className="shadow-none"
                  color="primary"
                  size="md"
                  onClick={handleSearch}
                >
                  Search
                </ButtonV2>
              </Grid>
              <Grid item>
                <ButtonV2
                  startIcon={<Avatar src={RefreshIcon} />}
                  variant="outlined"
                  color="primary"
                  size="md"
                  onClick={refreshHandler}
                >
                  Reset
                </ButtonV2>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Toolbar>
      <Toolbar>
        <Grid container spacing={1} alignItems="center" justifyContent="flex-end">
          <Grid item>
            <ButtonV2
              startIcon={<AddCircle />}
              variant="contained"
              className="shadow-none"
              color="primary"
              size="sm"
              onClick={handleAddPartner}
            >
              Create
            </ButtonV2>
          </Grid>
          <Grid item>
            <ResposiveNewDesignMenu
              disabled={spinning}
              onSelect={(index) => {
                if (index >= 0) {
                  selectedMenu.current = items[index];
                  setmodel(true);
                }
              }}
              menuItems={[{}]}
            />
          </Grid>
        </Grid>
      </Toolbar>
      <div style={{ marginTop: "1rem" }}>
        <CardContent>
          <KisshtTable
            loading={spinning}
            columns={columns}
            data={partnership}
            onPageChange={onPageChange}
            showPagination={true}
            offset={offset}
            totalCount={1000}
            onResultsPerPageChange={onResultsPerPageChange}
          />
        </CardContent>
      </div>

      {model && (
        <KisshtDialog
          maxWidth="sm"
          title={selectedMenu.current.name}
          open={model}
          handleClose={setmodel}
        >
          <BulkUpload
            module={selectedMenu.current.module}
            reason={selectedMenu.current.reason}
            handleClose={setmodel}
            {...props}
          />
        </KisshtDialog>
      )}
      {openModal && editableRow && (
        <KisshtDialog
          scroll="body"
          maxWidth="lg"
          title="Edit Partnership Details"
          open={openModal}
          handleClose={handleEditableModelClose}
        >
          <DialogContent className={classes.dataHolder}>
            <Card className={classes.card}>
              <CardContent>
              <InfoAlert data=
                  "Please fill all the attribute to update the partnership details."/>
                <Editablepartnership
                  submitting={isEditSubmitting}
                  editableColumns={editableColumns}
                  requiredColumns={requiredColumns}
                  handleSubmit={handleRowEdit}
                  rowData={editableRow}
                />
              </CardContent>
            </Card>
          </DialogContent>
        </KisshtDialog>
      )}
      {openPartnerModal && (
        <KisshtDialog
          scroll="body"
          maxWidth="lg"
          title="Add Partner"
          open={openPartnerModal}
          handleClose={handleAddPartnerClose}
        >
          <DialogContent className={classes.dataHolder}>
            <Card className={classes.card}>
              <CardContent>
              <InfoAlert data=
                 "Please fill all the attribute to add the partner"/>
                <CreatePartner
                  submitting={isEditSubmitting}
                  handleSubmit={handleCreatePartner}
                  columns={[
                    {
                      label: "auth_client_reference_number",
                      required: true,
                    },
                    {
                      label: "business_type",
                      required: true,
                    },

                    {
                      label: "email",
                      required: true,
                    },
                    {
                      label: "contact_number",
                      required: true,
                    },
                    {
                      label: "status",
                      required: true,
                    },
                    {
                      label: "company_name",
                      required: true,
                    },
                  ]}
                />
              </CardContent>
            </Card>
          </DialogContent>
        </KisshtDialog>
      )}
    </>
  );
};

export default Partnership;
