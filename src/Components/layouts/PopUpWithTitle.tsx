import styled from 'styled-components';
import Popup from './PopUp';

const PopUpWithTitles = ({ title, subTitle, children, onClose, visible = true, canClickOut = true }: any) => {
  return (
    <Popup visible={visible} onClose={onClose} canClickOut={canClickOut}>
      <Title>{title}</Title>
      {children}
    </Popup>
  );
};

const Title = styled.div`
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 12px;
`;

export default PopUpWithTitles;
