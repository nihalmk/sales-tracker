import 'jsdom-global/register';
import ConfirmationDialog from '../ConfirmationDialog';
import { shallow, mount } from 'enzyme';
import { Alert } from 'tabler-react';

const mockSuccessCallback = jest.fn();
describe('ConfirmationDialog', () => {
  it('Should check for component message displayed', () => {
    const wrapper = shallow(
      <ConfirmationDialog message={'Confirm'} success={mockSuccessCallback} />,
    );
    const messageAlert = wrapper.find(Alert).first();
    expect(messageAlert.html()).toContain('Confirm');
  });

  it('Should callback with success when confirmed', () => {
    const wrapper = mount(
      <ConfirmationDialog message={'Confirm'} success={mockSuccessCallback} />,
    );
    const cancelButton = wrapper.find('button').at(1);
    cancelButton.simulate('click');
    expect(mockSuccessCallback).toBeCalledWith(true);
  });

  it('Should callback with failure when cancelled', () => {
    const wrapper = mount(
      <ConfirmationDialog message={'Confirm'} success={mockSuccessCallback} />,
    );
    const cancelButton = wrapper.find('button').at(0);
    cancelButton.simulate('click');
    expect(mockSuccessCallback).toBeCalledWith(false);
  });
});
