# cde-curator

`cde-curator` is a JavaScript/TypeScript project for helping users create, edit, review, and validate Common Data Elements (CDEs) before final submission.

The core goal of this repository is to make CDE authoring easier and safer by giving users a practical workflow for:

- editing CDE content in a structured format
- checking whether a CDE is complete and internally consistent
- catching formatting issues before official submission
- preparing cleaner, higher-quality CDE records for downstream review and publication

## Background

The NIH Common Data Elements (CDE) Repository is designed to provide access to structured, human-readable and machine-readable definitions of data elements recommended or required by NIH Institutes and Centers and other organizations. The repository is also intended to support discovery, harmonization, and reuse of data elements across research areas.

In the official NIH CDE Repository materials, the platform emphasizes several core workflows:

- searching for existing data elements and forms
- comparing and harmonizing related data elements
- creating new elements and measures

The NIH CDE Repository submission workflow also includes validation. According to the official Submission Workbook Validator guide, the validator is used to identify errors or gaps in a CDE submission workbook before NIH endorsement review and publication in the NIH CDE Repository.

This project is intended to support that broader workflow locally and programmatically, especially for users who want to curate CDEs earlier in the process instead of waiting until the final submission step to discover problems.

## What This Project Will Do

This repository is being set up to support tasks such as:

- loading and editing CDE records stored as JSON
- validating field presence, structure, and formatting
- checking common issues in names, definitions, designations, identifiers, and value domain metadata
- flagging incomplete or suspicious records before submission
- helping users prepare curated outputs that are easier to review and submit

The included sample file, [`cde-sample.json`](/Users/hh667/workspace/cde-curator/cde-sample.json), is an example CDE-style record that can be used during development and testing.

## Planned Workflow

A likely workflow for `cde-curator` is:

1. Load a CDE record or submission artifact.
2. Edit the content through a structured interface or scripted transformation.
3. Run validation checks for required fields, formatting, and consistency.
4. Review warnings and fix issues before final submission.
5. Export or submit the cleaned CDE artifact.

## Scope

This project is not the official NIH submission system. It is a companion tool intended to help authors and curators improve CDE quality before using the official submission and validation workflow.

## References

- NIH Common Data Elements Repository: [https://cde.nlm.nih.gov/home/](https://cde.nlm.nih.gov/home/)
- NIH CDE Submission Workbook Validator Guide: [https://cde.nlm.nih.gov/assets/SubWorkbookValidatorGuide-External.pdf](https://cde.nlm.nih.gov/assets/SubWorkbookValidatorGuide-External.pdf)
